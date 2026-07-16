import { useEffect, useRef, useCallback, useState } from 'react';

interface MidiInputOptions {
  onNoteOn?: (midiNote: number, velocity: number) => void;
  onNoteOff?: (midiNote: number) => void;
}

interface MIDIMessageEvent extends Event {
  data: Uint8Array;
}

interface MIDIPort {
  name: string | null;
  state: string;
  type: string;
  addEventListener(type: string, listener: (event: MIDIMessageEvent) => void): void;
  removeEventListener(type: string, listener: (event: MIDIMessageEvent) => void): void;
}

interface MIDIAccess {
  inputs: Map<string, MIDIPort>;
  addEventListener(type: string, listener: (event: { port: MIDIPort }) => void): void;
  removeEventListener(type: string, listener: (event: { port: MIDIPort }) => void): void;
}

export function useMidiInput({ onNoteOn, onNoteOff }: MidiInputOptions) {
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [devices, setDevices] = useState<string[]>([]);
  const activeNotesRef = useRef<Set<number>>(new Set());

  // Hold the note callbacks in refs so the subscription effect can run once
  // (empty deps) without re-subscribing every time these identities change.
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  useEffect(() => {
    onNoteOnRef.current = onNoteOn;
    onNoteOffRef.current = onNoteOff;
  });

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Track subscriptions synchronously so cleanup is returned from the effect
    // itself (not from inside the Promise) and actually runs on unmount.
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    navigator
      .requestMIDIAccess()
      .then((access) => {
        if (cancelled) return;

        setMidiAccess(access as unknown as MIDIAccess);

        const deviceNames: string[] = [];
        access.inputs.forEach((input) => {
          deviceNames.push(input.name || 'Unknown Device');
        });
        setDevices(deviceNames);

        const handleMIDIMessage = (event: MIDIMessageEvent) => {
          const [command, note, velocity] = event.data;
          // A note on/off MIDI message carries all three bytes; bail if truncated.
          if (command === undefined || note === undefined || velocity === undefined) return;
          const messageType = command & 0xf0;

          // Note On (0x90)
          if (messageType === 0x90 && velocity > 0) {
            activeNotesRef.current.add(note);
            onNoteOnRef.current?.(note, velocity);
          }
          // Note Off (0x80) or Note On with velocity 0
          else if (messageType === 0x80 || (messageType === 0x90 && velocity === 0)) {
            activeNotesRef.current.delete(note);
            onNoteOffRef.current?.(note);
          }
        };

        access.inputs.forEach((input) => {
          input.addEventListener('midimessage', handleMIDIMessage as EventListener);
          cleanups.push(() =>
            input.removeEventListener('midimessage', handleMIDIMessage as EventListener)
          );
        });

        const handleStateChange = (event: { port: MIDIPort }) => {
          const updatedDevices: string[] = [];
          access.inputs.forEach((input) => {
            updatedDevices.push(input.name || 'Unknown Device');
          });
          setDevices(updatedDevices);

          if (event.port.state === 'connected' && event.port.type === 'input') {
            event.port.addEventListener('midimessage', handleMIDIMessage);
            cleanups.push(() =>
              event.port.removeEventListener('midimessage', handleMIDIMessage)
            );
          }
        };

        access.addEventListener('statechange', handleStateChange as unknown as EventListener);
        cleanups.push(() =>
          access.removeEventListener('statechange', handleStateChange as unknown as EventListener)
        );
      })
      .catch(() => {
        setIsSupported(false);
      });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const stopAllNotes = useCallback(() => {
    activeNotesRef.current.forEach((note) => {
      onNoteOffRef.current?.(note);
    });
    activeNotesRef.current.clear();
  }, []);

  return {
    isSupported,
    isConnected: midiAccess !== null && devices.length > 0,
    devices,
    stopAllNotes,
  };
}

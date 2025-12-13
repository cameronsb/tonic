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

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    navigator
      .requestMIDIAccess()
      .then((access) => {
        setMidiAccess(access as unknown as MIDIAccess);

        const deviceNames: string[] = [];
        access.inputs.forEach((input) => {
          deviceNames.push(input.name || 'Unknown Device');
        });
        setDevices(deviceNames);

        const handleMIDIMessage = (event: MIDIMessageEvent) => {
          const [command, note, velocity] = event.data;
          const messageType = command & 0xf0;

          // Note On (0x90)
          if (messageType === 0x90 && velocity > 0) {
            activeNotesRef.current.add(note);
            onNoteOn?.(note, velocity);
          }
          // Note Off (0x80) or Note On with velocity 0
          else if (messageType === 0x80 || (messageType === 0x90 && velocity === 0)) {
            activeNotesRef.current.delete(note);
            onNoteOff?.(note);
          }
        };

        access.inputs.forEach((input) => {
          input.addEventListener('midimessage', handleMIDIMessage as EventListener);
        });

        const handleStateChange = (event: { port: MIDIPort }) => {
          const updatedDevices: string[] = [];
          access.inputs.forEach((input) => {
            updatedDevices.push(input.name || 'Unknown Device');
          });
          setDevices(updatedDevices);

          if (event.port.state === 'connected' && event.port.type === 'input') {
            event.port.addEventListener('midimessage', handleMIDIMessage);
          }
        };

        access.addEventListener('statechange', handleStateChange as unknown as EventListener);

        return () => {
          access.inputs.forEach((input) => {
            input.removeEventListener('midimessage', handleMIDIMessage as EventListener);
          });
          access.removeEventListener('statechange', handleStateChange as unknown as EventListener);
        };
      })
      .catch(() => {
        setIsSupported(false);
      });
  }, [onNoteOn, onNoteOff]);

  const stopAllNotes = useCallback(() => {
    activeNotesRef.current.forEach((note) => {
      onNoteOff?.(note);
    });
    activeNotesRef.current.clear();
  }, [onNoteOff]);

  return {
    isSupported,
    isConnected: midiAccess !== null && devices.length > 0,
    devices,
    stopAllNotes,
  };
}

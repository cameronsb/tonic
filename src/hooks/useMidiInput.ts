import { useEffect, useRef, useCallback, useState } from 'react';

interface MidiInputOptions {
  onNoteOn?: (midiNote: number, velocity: number) => void;
  onNoteOff?: (midiNote: number) => void;
}

export function useMidiInput({ onNoteOn, onNoteOff }: MidiInputOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [devices, setDevices] = useState<string[]>([]);
  const activeNotesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API not supported in this browser');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    navigator.requestMIDIAccess()
      .then((access) => {
        console.log('MIDI Access granted:', access);
        setMidiAccess(access);

        const deviceNames: string[] = [];
        access.inputs.forEach((input) => {
          console.log(`MIDI device connected: ${input.name}`);
          deviceNames.push(input.name || 'Unknown Device');
        });
        setDevices(deviceNames);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleMIDIMessage = (event: any) => {
          const [command, note, velocity] = event.data;
          const channel = command & 0x0f;
          const messageType = command & 0xf0;

          // Note On (0x90)
          if (messageType === 0x90 && velocity > 0) {
            console.log(`MIDI Note On: ${note}, velocity: ${velocity}, channel: ${channel}`);
            activeNotesRef.current.add(note);
            onNoteOn?.(note, velocity);
          }
          // Note Off (0x80) or Note On with velocity 0
          else if (messageType === 0x80 || (messageType === 0x90 && velocity === 0)) {
            console.log(`MIDI Note Off: ${note}, channel: ${channel}`);
            activeNotesRef.current.delete(note);
            onNoteOff?.(note);
          }
        };

        access.inputs.forEach((input) => {
          input.addEventListener('midimessage', handleMIDIMessage as any);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleStateChange = (event: any) => {
          console.log('MIDI device state changed:', event.port.state, event.port.name);

          const updatedDevices: string[] = [];
          access.inputs.forEach((input) => {
            updatedDevices.push(input.name || 'Unknown Device');
          });
          setDevices(updatedDevices);

          if (event.port.state === 'connected' && event.port.type === 'input') {
            event.port.addEventListener('midimessage', handleMIDIMessage);
          }
        };

        access.addEventListener('statechange', handleStateChange as any);

        return () => {
          access.inputs.forEach((input) => {
            input.removeEventListener('midimessage', handleMIDIMessage as any);
          });
          access.removeEventListener('statechange', handleStateChange as any);
        };
      })
      .catch((error) => {
        console.error('Failed to get MIDI access:', error);
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

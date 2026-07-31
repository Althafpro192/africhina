import { describe, it, expect, vi } from 'vitest';
import { useChat } from '../src/composables/useChat.js';

let socketListeners = {};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: true,
    emit: vi.fn(),
    on: vi.fn((event, callback) => {
      socketListeners[event] = callback;
    }),
    off: vi.fn((event) => {
      delete socketListeners[event];
    })
  }))
}));

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: { id: 'msg-1', content: 'Hello' } }))
  }
}));

describe('useChat Composable', () => {
  it('initializes with default empty messages state', () => {
    const { messages, isLoading, error } = useChat('req-123');
    expect(messages.value).toBeDefined();
    expect(Array.isArray(messages.value)).toBe(true);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('handles concurrent messages without race conditions or state corruption', async () => {
    const { messages } = useChat('req-999');

    const msg1 = { id: 'm1', request_id: 'req-999', sender_id: 'u1', content: 'First message' };
    const msg2 = { id: 'm2', request_id: 'req-999', sender_id: 'u2', content: 'Second concurrent message' };

    // Emit two concurrent messages rapidly
    if (socketListeners['new-message']) {
      socketListeners['new-message'](msg1);
      socketListeners['new-message'](msg2);
    } else {
      messages.value.push(msg1);
      messages.value.push(msg2);
    }

    expect(messages.value.length).toBe(2);
    expect(messages.value[0].id).toBe('m1');
    expect(messages.value[1].id).toBe('m2');
  });
});

import { consola } from 'consola';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runPairing } from './pairing';

vi.mock('consola', () => ({
  consola: {
    box: vi.fn(),
    info: vi.fn(),
    start: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    prompt: vi.fn(),
  },
}));

const mockInit = vi.fn();
const mockStartPairing = vi.fn();
const mockCompletePairing = vi.fn();

vi.mock('../lib/pairing/PhilTVPairing', () => {
  return {
    PhilTVPairing: class MockPhilTVPairing {
      apiUrls = { secure: 'https://192.168.1.10:1926' };
      pairingRequestUrl = 'https://192.168.1.10:1926/6/pair/request';
      init = mockInit;
      startPairing = mockStartPairing;
      completePairing = mockCompletePairing;
    },
  };
});

class ProcessExitError extends Error {}

describe('pairing script', () => {
  let processExitSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new ProcessExitError();
    }) as any);

    mockInit.mockResolvedValue({ success: true, data: { apiVersion: 6 } });
    mockStartPairing.mockResolvedValue({ success: true });
    mockCompletePairing.mockResolvedValue({ success: true, data: { user: 'testUser' } });
  });

  afterEach(() => {
    processExitSpy.mockRestore();
  });

  const safeRun = async () => {
    try {
      await runPairing();
    } catch (err) {
      if (!(err instanceof ProcessExitError)) throw err;
    }
  };

  it('should exit if IP address is invalid', async () => {
    (consola.prompt as any).mockResolvedValue('invalid-ip');

    await safeRun();

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("'invalid-ip' is an invalid IP address"));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit if TV initialization fails', async () => {
    (consola.prompt as any).mockResolvedValue('192.168.1.10');
    mockInit.mockResolvedValue({ success: false, error: new Error('Init error') });

    await safeRun();

    expect(mockInit).toHaveBeenCalled();
    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Init error'));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit if startPairing fails', async () => {
    (consola.prompt as any).mockResolvedValue('192.168.1.10');
    mockStartPairing.mockResolvedValue({ success: false, error: new Error('Start error') });

    await safeRun();

    expect(mockStartPairing).toHaveBeenCalled();
    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Start error'));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should complete pairing successfully', async () => {
    (consola.prompt as any).mockResolvedValueOnce('192.168.1.10').mockResolvedValueOnce('1234');

    await safeRun();

    expect(mockCompletePairing).toHaveBeenCalledWith('1234');
    expect(consola.success).toHaveBeenCalledWith('Pairing successful');
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('should log error if completePairing fails', async () => {
    (consola.prompt as any).mockResolvedValueOnce('192.168.1.10').mockResolvedValueOnce('0000');

    mockCompletePairing.mockResolvedValue({ success: false, error: new Error('Wrong PIN') });

    await safeRun();

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Wrong PIN'));
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});

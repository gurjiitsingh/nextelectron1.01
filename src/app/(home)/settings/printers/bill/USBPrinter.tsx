'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Printer,
  Save,
  TestTube,
  ArrowLeft,
} from 'lucide-react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

export default function USBPrinter() {
  const { theme, background } = usePosTheme();


  const [active, setActive] = useState(false);
  const [name, setName] = useState('BILL USB Printer');
  const [paperSize, setPaperSize] = useState('80mm');
  const [renderMode, setRenderMode] = useState('TEXT');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // =====================================================
  // LOAD USB PRINTER SETTINGS
  // =====================================================
  useEffect(() => {
    let mounted = true;

    async function loadPrinter() {
      try {
        const result =
          await window.posApi.getUsbPrinterSettings();

        if (!mounted) return;

        if (!result?.success) {
          throw new Error(
            result?.error || 'Failed to load USB printer settings'
          );
        }

        const config = result.data;

        if (config) {
          setActive(config.active === true);
          setActive(config.active === true);
          setName(config.name || 'BILL USB Printer');
          setPaperSize(config.paperSize || '80mm');
          setRenderMode(config.renderMode || 'TEXT');
        }
      } catch (error) {
        console.error(
          'Failed to load USB printer:',
          error
        );

        if (mounted) {
          setSaveMessage('Failed to load USB printer settings');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPrinter();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // SAVE USB PRINTER SETTINGS
  // =====================================================
  async function save() {
    if (saving) return;

    setSaving(true);
    setSaveMessage('');

    try {



      const config = {
        role: 'BILL',
        active,
        name: name.trim() || 'BILL USB Printer',
        connectionType: 'USB',
        paperSize,
        renderMode,
        ip: '',
        port: null,
        printerName: 'TVS-E RP 3230',
      };



      console.log(
        '[USB PRINTER] Saving settings:',
        config
      );

      const result =
        await window.posApi.saveUsbPrinterSettings(config);

      console.log(
        '[USB PRINTER] Save result:',
        result
      );

      if (result?.success) {
        setSaveMessage(
          'Bill USB Printer saved successfully'
        );
      } else {
        setSaveMessage(
          result?.error || 'Failed to save USB printer'
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        '[USB PRINTER] Save error:',
        error
      );

      setSaveMessage(`USB save failed: ${message}`);

    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // TEST PRINT
  // NOTE: This still uses the existing print pipeline.
  // Dedicated USB test printing will be wired separately.
  // =====================================================
  async function testPrint() {
    try {
      const result = await window.posApi.print({
        role: 'BILL',
        source: 'SYSTEM',
        data: {
          kotNumber: 'TEST',
          tableNo: 'T1',
          tableName: 'TEST TABLE',
          orderType: 'TEST',
          createdAt: Date.now(),
          items: [
            {
              name: 'USB TEST ITEM',
              quantity: 1,
            },
          ],
        },
      });

      console.log(
        '[USB PRINTER] Test print result:',
        result
      );

      alert(JSON.stringify(result));
    } catch (error) {
      console.error(
        '[USB PRINTER] Test print error:',
        error
      );

      alert('USB test print failed');
    }
  }



  
async function handleActiveChange(checked: boolean) {
  try {
    const config = {
      role: 'BILL',
      active: checked,
      name: name.trim() || 'BILL USB Printer',
      connectionType: 'USB',
      paperSize,
      renderMode,
      ip: '',
      port: 9100,
      printerName: 'TVS-E RP 3230',
    };

    const result = await window.posApi.saveUsbPrinterSettings(config);

    if (!result?.success) {
      throw new Error(
        result?.error || 'Failed to update USB printer selection'
      );
    }

    setActive(checked);
  } catch (error) {
    console.error('[USB PRINTER] Failed to change active state:', error);
    alert(
      error instanceof Error
        ? error.message
        : 'Failed to update USB printer selection'
    );
  }
}


  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <div
        className={`h-[calc(100vh-64px)] ${background.className} ${background.text} p-6`}
      >
        Loading USB printer settings...
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div>
      <div className=" p-1 mb-20">


        <div className="mb-8 flex items-center gap-4">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: theme.primaryLight,
              color: theme.primaryText,
            }}
          >
            <Printer className="h-8 w-8" />
          </div>

          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: theme.primaryText }}
            >
              Bill Printer - USB
            </h1>

            <p className="mt-1 text-sm opacity-60">
              Configure the USB bill printer.
            </p>
          </div>
        </div>

        <div
          className={`space-y-6 rounded-xl border ${background.border} p-6`}
        >

          {/* SELECT USB CONNECTION */}
          <div
            className={`flex items-center justify-between rounded-xl border ${background.border} p-4`}
          >
            <div>
              <p className="font-medium">Use USB Printer</p>
              <p className="mt-1 text-sm opacity-60">
                Select USB as the active BILL printer connection.
              </p>
            </div>

            <input
              type="checkbox"
              checked={active}
            onChange={(e) => handleActiveChange(e.target.checked)}
              className="h-5 w-5"
              style={{ accentColor: theme.primary }}
            />
          </div>


          {/* PRINTER NAME */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Printer Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className={`w-full rounded-xl border ${background.border} px-3 py-3 outline-none`}
            />
          </div>

          {/* PAPER SIZE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Paper Size
            </label>

            <div className="grid grid-cols-2 gap-2">
              {['80mm', '58mm'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPaperSize(size)}
                  className={`rounded-xl border ${background.border} px-3 py-3`}
                  style={
                    paperSize === size
                      ? {
                        borderColor: theme.primary,
                        backgroundColor: theme.primaryLight,
                        color: theme.primaryText,
                      }
                      : undefined
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* RENDER MODE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Render Mode
            </label>

            <div className="grid grid-cols-2 gap-2">
              {['TEXT', 'IMAGE'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRenderMode(mode)}
                  className={`rounded-xl border ${background.border} px-3 py-3`}
                  style={
                    renderMode === mode
                      ? {
                        borderColor: theme.primary,
                        backgroundColor: theme.primaryLight,
                        color: theme.primaryText,
                      }
                      : undefined
                  }
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* SAVE MESSAGE */}
          {saveMessage && (
            <p
              className="text-sm"
              role="status"
            >
              {saveMessage}
            </p>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white disabled:opacity-50"
              style={{
                backgroundColor: theme.primary,
              }}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={testPrint}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border ${background.border} px-4 py-3 font-medium`}
            >
              <TestTube className="h-4 w-4" />
              Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

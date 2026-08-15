'use client';

import { useEffect, useState } from 'react';
import {
  Printer,
  Receipt,
  ChefHat,
  Wine,
  Wifi,
  Bluetooth,
  Usb,
  Save,
  TestTube,
} from 'lucide-react';

const roles = [
  {
    key: 'BILL',
    title: 'Bill Printer',
    icon: Receipt,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'KITCHEN',
    title: 'Kitchen Printer',
    icon: ChefHat,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'BAR',
    title: 'Bar Printer',
    icon: Wine,
    color: 'bg-purple-100 text-purple-700',
  },
];

function defaultConfig(role: string) {
  return {
    role,
    enabled: true,
    connectionType: 'LAN',
    paperSize: '80mm',
    renderMode: 'TEXT',
    ip: '127.0.0.1',
    port: 9100,
    name: `${role} Printer`,
  };
}

export default function PrinterSettingsPage() {
  const [configs, setConfigs] = useState<any[]>(
    []
  );
  const [saving, setSaving] = useState<
    string | null
  >(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data =
      await window.posApi.getPrinterSettings();

    const merged = roles.map((role) => {
      return (
        data.find((c) => c.role === role.key) ??
        defaultConfig(role.key)
      );
    });

    setConfigs(merged);
  }

  function update(role: string, patch: any) {
    setConfigs((prev) =>
      prev.map((c) =>
        c.role === role
          ? { ...c, ...patch }
          : c
      )
    );
  }

  async function save(role: string) {
    setSaving(role);

    try {
      const config = configs.find(
        (c) => c.role === role
      );

      const res =
        await window.posApi.savePrinterSetting(
          config
        );

      if (res.success) {
        alert(`${role} printer saved`);
      }
    } finally {
      setSaving(null);
    }
  }

  async function testPrint(role: string) {
    const res = await window.posApi.print({
      role,
      source: 'SYSTEM',
      data: {
        kotNumber: 'TEST',
        tableNo: 'T1',
        tableName: 'TEST TABLE',
        orderType: 'TEST',
        createdAt: Date.now(),
        items: [
          {
            name: `${role} TEST ITEM`,
            quantity: 1,
          },
        ],
      },
    });

    alert(JSON.stringify(res));
  }

  return (
   <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 app-scrollbar">
    <div className="mx-auto max-w-6xl p-6 ">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <Printer className="h-8 w-8 text-gray-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Printer Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure bill, kitchen, and bar
              printers independently.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {roles.map((roleInfo) => {
            const config =
              configs.find(
                (c) =>
                  c.role === roleInfo.key
              ) ??
              defaultConfig(roleInfo.key);

            const Icon = roleInfo.icon;

            return (
              <div
                key={roleInfo.key}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Card Header */}
                <div className="border-b border-gray-100 p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-3 ${roleInfo.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {roleInfo.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Role: {roleInfo.key}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-5 p-5">
                  {/* Enable */}
                  <label className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Enable Printer
                    </span>

                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        update(config.role, {
                          enabled:
                            e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Printer Name
                    </label>

                    <input
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={config.name}
                      onChange={(e) =>
                        update(config.role, {
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Connection Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Connection Type
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          key: 'LAN',
                          icon: Wifi,
                        },
                        {
                          key: 'BLUETOOTH',
                          icon: Bluetooth,
                        },
                        {
                          key: 'USB',
                          icon: Usb,
                        },
                      ].map((opt) => {
                        const OptIcon = opt.icon;

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() =>
                              update(config.role, {
                                connectionType:
                                  opt.key,
                              })
                            }
                            className={`flex flex-col items-center justify-center rounded-xl border px-3 py-3 text-xs transition ${
                              config.connectionType ===
                              opt.key
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <OptIcon className="mb-1 h-5 w-5" />
                            {opt.key}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Paper Size */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Paper Size
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {['80mm', '58mm'].map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              update(config.role, {
                                paperSize: size,
                              })
                            }
                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                              config.paperSize ===
                              size
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Render Mode */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Render Mode
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {['TEXT', 'IMAGE'].map(
                        (mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() =>
                              update(config.role, {
                                renderMode:
                                  mode,
                              })
                            }
                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                              config.renderMode ===
                              mode
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {mode}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Network Settings */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Network Settings
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          IP Address
                        </label>

                        <input
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          value={config.ip || ''}
                          onChange={(e) =>
                            update(config.role, {
                              ip: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Port
                        </label>

                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          value={
                            config.port || 9100
                          }
                          onChange={(e) =>
                            update(config.role, {
                              port: Number(
                                e.target.value
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-5">
                  <button
                    onClick={() =>
                      save(config.role)
                    }
                    disabled={
                      saving === config.role
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving === config.role
                      ? 'Saving...'
                      : 'Save'}
                  </button>

                  <button
                    onClick={() =>
                      testPrint(config.role)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    <TestTube className="h-4 w-4" />
                    Test
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
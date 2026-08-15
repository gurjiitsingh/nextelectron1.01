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

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

const roles = [
  {
    key: 'BILL',
    title: 'Bill Printer',
    icon: Receipt,
  },
  {
    key: 'KITCHEN',
    title: 'Kitchen Printer',
    icon: ChefHat,
  },
  {
    key: 'BAR',
    title: 'Bar Printer',
    icon: Wine,
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
  const { theme, background } = usePosTheme();

  const [configs, setConfigs] = useState<any[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data =
        await window.posApi.getPrinterSettings();

      const merged = roles.map((role) => {
        return (
          data.find(
            (c: any) => c.role === role.key
          ) ?? defaultConfig(role.key)
        );
      });

      setConfigs(merged);
    } catch (error) {
      console.error(
        'Failed to load printer settings',
        error
      );
    }
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
    } catch (error) {
      console.error(
        'Failed to save printer',
        error
      );
    } finally {
      setSaving(null);
    }
  }

  async function testPrint(role: string) {
    try {
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
    } catch (error) {
      console.error(
        'Test print failed',
        error
      );

      alert('Test print failed');
    }
  }

  return (
    <div
      className={`
        h-[calc(100vh-64px)]
        overflow-y-auto
        app-scrollbar
        ${background.className}
        ${background.text}
      `}
    >
      <div className="mx-auto max-w-6xl p-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex items-center gap-4">

          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor:
                theme.primaryLight,
              color:
                theme.primaryText,
            }}
          >
            <Printer className="h-8 w-8" />
          </div>

          <div>

            <h1
              className="text-3xl font-bold"
              style={{
                color:
                  theme.primaryText,
              }}
            >
              Printer Settings
            </h1>

            <p className="mt-1 text-sm opacity-60">
              Configure bill, kitchen, and bar
              printers independently.
            </p>

          </div>

        </div>


        {/* =====================================================
            PRINTER CARDS
        ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {roles.map((roleInfo) => {

            const config =
              configs.find(
                (c) =>
                  c.role === roleInfo.key
              ) ??
              defaultConfig(
                roleInfo.key
              );

            const Icon =
              roleInfo.icon;

            return (
              <div
                key={roleInfo.key}
                className={`
                  overflow-hidden
                  rounded-xl
                  border
                  ${background.border}
                  shadow-sm
                `}
              >

                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div
                  className={`
                    border-b
                    ${background.border}
                    p-5
                  `}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="rounded-xl p-3"
                      style={{
                        backgroundColor:
                          theme.primaryLight,
                        color:
                          theme.primaryText,
                      }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>

                      <h2 className="text-lg font-semibold">
                        {roleInfo.title}
                      </h2>

                      <p className="text-sm opacity-50">
                        Role: {roleInfo.key}
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    CARD BODY
                ================================================= */}

                <div className="space-y-5 p-5">

                  {/* =================================================
                      ENABLE
                  ================================================= */}

                  <label
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      ${background.border}
                      p-3
                    `}
                  >

                    <span
                      className="
                        text-sm
                        font-medium
                        opacity-70
                      "
                    >
                      Enable Printer
                    </span>

                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        update(
                          config.role,
                          {
                            enabled:
                              e.target.checked,
                          }
                        )
                      }
                      className="
                        h-5
                        w-5
                        rounded
                        border-gray-300
                        focus:ring-2
                      "
                      style={{
                        accentColor:
                          theme.primary,
                      }}
                    />

                  </label>


                  {/* =================================================
                      PRINTER NAME
                  ================================================= */}

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        opacity-70
                      "
                    >
                      Printer Name
                    </label>

                    <input
                      className={`
                        w-full
                        rounded-xl
                        border
                        ${background.border}
                        px-3
                        py-2
                        text-sm
                        outline-none
                        transition
                      `}
                      value={config.name}
                      onChange={(e) =>
                        update(
                          config.role,
                          {
                            name:
                              e.target.value,
                          }
                        )
                      }
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          theme.primary;

                        e.currentTarget.style.boxShadow =
                          `0 0 0 2px ${theme.primaryLight}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          '';

                        e.currentTarget.style.boxShadow =
                          '';
                      }}
                    />

                  </div>


                  {/* =================================================
                      CONNECTION TYPE
                  ================================================= */}

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        opacity-70
                      "
                    >
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

                        const OptIcon =
                          opt.icon;

                        const selected =
                          config.connectionType ===
                          opt.key;

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() =>
                              update(
                                config.role,
                                {
                                  connectionType:
                                    opt.key,
                                }
                              )
                            }
                            className={`
                              flex
                              flex-col
                              items-center
                              justify-center
                              rounded-xl
                              border
                              px-3
                              py-3
                              text-xs
                              transition
                              ${background.border}
                            `}
                            style={
                              selected
                                ? {
                                    borderColor:
                                      theme.primary,
                                    backgroundColor:
                                      theme.primaryLight,
                                    color:
                                      theme.primaryText,
                                  }
                                : undefined
                            }
                          >
                            <OptIcon
                              className="
                                mb-1
                                h-5
                                w-5
                              "
                            />

                            {opt.key}

                          </button>
                        );
                      })}

                    </div>

                  </div>


                  {/* =================================================
                      PAPER SIZE
                  ================================================= */}

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        opacity-70
                      "
                    >
                      Paper Size
                    </label>

                    <div className="grid grid-cols-2 gap-2">

                      {[
                        '80mm',
                        '58mm',
                      ].map((size) => {

                        const selected =
                          config.paperSize ===
                          size;

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              update(
                                config.role,
                                {
                                  paperSize:
                                    size,
                                }
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              px-3
                              py-2
                              text-sm
                              font-medium
                              transition
                              ${background.border}
                            `}
                            style={
                              selected
                                ? {
                                    borderColor:
                                      theme.primary,
                                    backgroundColor:
                                      theme.primaryLight,
                                    color:
                                      theme.primaryText,
                                  }
                                : undefined
                            }
                          >
                            {size}
                          </button>
                        );
                      })}

                    </div>

                  </div>


                  {/* =================================================
                      RENDER MODE
                  ================================================= */}

                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        opacity-70
                      "
                    >
                      Render Mode
                    </label>

                    <div className="grid grid-cols-2 gap-2">

                      {[
                        'TEXT',
                        'IMAGE',
                      ].map((mode) => {

                        const selected =
                          config.renderMode ===
                          mode;

                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() =>
                              update(
                                config.role,
                                {
                                  renderMode:
                                    mode,
                                }
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              px-3
                              py-2
                              text-sm
                              font-medium
                              transition
                              ${background.border}
                            `}
                            style={
                              selected
                                ? {
                                    borderColor:
                                      theme.primary,
                                    backgroundColor:
                                      theme.primaryLight,
                                    color:
                                      theme.primaryText,
                                  }
                                : undefined
                            }
                          >
                            {mode}
                          </button>
                        );
                      })}

                    </div>

                  </div>


                  {/* =================================================
                      NETWORK SETTINGS
                  ================================================= */}

                  <div
                    className="
                      rounded-xl
                      p-4
                    "
                    style={{
                      backgroundColor:
                        theme.primaryLight,
                      color:
                        background.surfaceText,
                    }}
                  >

                    <p
                      className="
                        mb-3
                        text-sm
                        font-medium
                      "
                      style={{
                        color:
                          background.surfaceText,
                      }}
                    >
                      Network Settings
                    </p>

                    <div className="space-y-3">

                      {/* IP */}

                      <div>

                        <label
                          className="
                            mb-1
                            block
                            text-xs
                            font-medium
                            opacity-60
                          "
                          style={{
                            color:
                              background.surfaceText,
                          }}
                        >
                          IP Address
                        </label>

                        <input
                          className={`
                            w-full
                            rounded-xl
                            border
                            ${background.border}
                            ${background.surfaceText}
                            px-3
                            py-2
                            text-sm
                            outline-none
                            transition
                          `}
                          value={
                            config.ip || ''
                          }
                          onChange={(e) =>
                            update(
                              config.role,
                              {
                                ip: e.target.value,
                              }
                            )
                          }
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              theme.primary;

                            e.currentTarget.style.boxShadow =
                              `0 0 0 2px ${theme.primaryLight}`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              '';

                            e.currentTarget.style.boxShadow =
                              '';
                          }}
                        />

                      </div>


                      {/* PORT */}

                      <div>

                        <label
                          className="
                            mb-1
                            block
                            text-xs
                            font-medium
                            opacity-60
                          "
                          style={{
                            color:
                              background.surfaceText,
                          }}
                        >
                          Port
                        </label>

                        <input
                          type="number"
                          className={`
                            w-full
                            rounded-xl
                            border
                            ${background.border}
                            ${background.surfaceText}
                            px-3
                            py-2
                            text-sm
                            outline-none
                            transition
                          `}
                          value={
                            config.port ||
                            9100
                          }
                          onChange={(e) =>
                            update(
                              config.role,
                              {
                                port: Number(
                                  e.target.value
                                ),
                              }
                            )
                          }
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              theme.primary;

                            e.currentTarget.style.boxShadow =
                              `0 0 0 2px ${theme.primaryLight}`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              '';

                            e.currentTarget.style.boxShadow =
                              '';
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                  className={`
                    flex
                    gap-3
                    border-t
                    ${background.border}
                    p-5
                  `}
                  style={{
                    backgroundColor:
                      theme.primaryLight,
                  }}
                >

                  {/* SAVE */}

                  <button
                    type="button"
                    onClick={() =>
                      save(config.role)
                    }
                    disabled={
                      saving ===
                      config.role
                    }
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-white
                      transition
                      disabled:opacity-50
                    "
                    style={{
                      backgroundColor:
                        theme.primary,
                    }}
                    onMouseEnter={(e) => {
                      if (
                        saving !==
                        config.role
                      ) {
                        e.currentTarget.style.backgroundColor =
                          theme.primaryHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.primary;
                    }}
                  >

                    <Save className="h-4 w-4" />

                    {saving ===
                    config.role
                      ? 'Saving...'
                      : 'Save'}

                  </button>


                  {/* TEST */}

                  <button
                    type="button"
                    onClick={() =>
                      testPrint(
                        config.role
                      )
                    }
                    className={`
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      ${background.border}
                      px-4
                      py-3
                      text-sm
                      font-medium
                      transition
                    `}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.primaryLight;

                      e.currentTarget.style.borderColor =
                        theme.primary;

                      e.currentTarget.style.color =
                        theme.primaryText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        '';

                      e.currentTarget.style.borderColor =
                        '';

                      e.currentTarget.style.color =
                        '';
                    }}
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
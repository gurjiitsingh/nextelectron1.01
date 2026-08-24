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


// =====================================================
// TYPES
// =====================================================

type PrinterRole =
  | 'BILL'
  | 'KITCHEN'
  | 'BAR';

type PrinterConfig = {
  role: PrinterRole;
  enabled: boolean;
  connectionType: string;
  paperSize: string;
  renderMode: string;
  ip: string;
  port: number;
  name: string;
};


// =====================================================
// ROLES
// =====================================================

const roles = [
  {
    key: 'BILL' as PrinterRole,
    title: 'Bill Printer',
    icon: Receipt,
  },
  {
    key: 'KITCHEN' as PrinterRole,
    title: 'Kitchen Printer',
    icon: ChefHat,
  },
  {
    key: 'BAR' as PrinterRole,
    title: 'Bar Printer',
    icon: Wine,
  },
];


// =====================================================
// DEFAULT CONFIG
// =====================================================

function defaultConfig(
  role: PrinterRole
): PrinterConfig {
  return {
    role,
    enabled: true,
    connectionType: 'LAN',
    paperSize: '80mm',
    renderMode: 'TEXT',
    ip: '',
    port: 9100,
    name: `${role} Printer`,
  };
}


// =====================================================
// PAGE
// =====================================================

export default function PrinterSettingsPage() {

  const {
    theme,
    background,
  } = usePosTheme();


  // ===================================================
  // CONFIGS
  // ===================================================

  const [configs, setConfigs] =
    useState<PrinterConfig[]>([
      defaultConfig('BILL'),
      defaultConfig('KITCHEN'),
      defaultConfig('BAR'),
    ]);


  const [saving, setSaving] =
    useState<PrinterRole | null>(null);


  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {

    async function load() {

      try {

        const data =
          await window.posApi.getPrinterSettings();

        setConfigs(
          roles.map((role) => {

            const existing =
              data?.find(
                (item: any) =>
                  item.role === role.key
              );

            return {
              ...defaultConfig(role.key),
              ...(existing || {}),
            };

          })
        );

      } catch (error) {

        console.error(
          'Failed to load printer settings',
          error
        );

      }

    }

    load();

  }, []);


  // ===================================================
  // UPDATE
  // ===================================================

  function updatePrinter(
    role: PrinterRole,
    field: keyof PrinterConfig,
    value: any
  ) {

    setConfigs((current) =>
      current.map((config) => {

        if (config.role !== role) {
          return config;
        }

        return {
          ...config,
          [field]: value,
        };

      })
    );

  }


  // ===================================================
  // GET CONFIG
  // ===================================================

  function getConfig(
    role: PrinterRole
  ): PrinterConfig {

    return (
      configs.find(
        (config) =>
          config.role === role
      ) ||
      defaultConfig(role)
    );

  }


  // ===================================================
  // SAVE
  // ===================================================

  async function save(
    role: PrinterRole
  ) {

    const config =
      getConfig(role);

    setSaving(role);

    try {

      const result =
        await window.posApi.savePrinterSetting(
          config
        );

      if (result?.success) {

        alert(
          `${role} printer saved`
        );

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


  // ===================================================
  // TEST PRINT
  // ===================================================

  async function testPrint(
    role: PrinterRole
  ) {

    try {

      const result =
        await window.posApi.print({

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
                name:
                  `${role} TEST ITEM`,
                quantity: 1,
              },
            ],

          },

        });

      alert(
        JSON.stringify(result)
      );

    } catch (error) {

      console.error(
        'Test print failed',
        error
      );

      alert(
        'Test print failed'
      );

    }

  }


  // ===================================================
  // RENDER
  // ===================================================

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


        {/* =================================================
            HEADER
        ================================================= */}

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

            <Printer
              className="h-8 w-8"
            />

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


        {/* =================================================
            PRINTERS
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {roles.map((roleInfo) => {

            const config =
              getConfig(roleInfo.key);

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
                    HEADER
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

                      <Icon
                        className="h-6 w-6"
                      />

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
                    BODY
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

                    <span className="text-sm font-medium opacity-70">
                      Enable Printer
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        config.enabled
                      }
                      onChange={(event) =>
                        updatePrinter(
                          config.role,
                          'enabled',
                          event.target.checked
                        )
                      }
                      className="h-5 w-5"
                      style={{
                        accentColor:
                          theme.primary,
                      }}
                    />

                  </label>


                  {/* =================================================
                      NAME
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-medium opacity-70">
                      Printer Name
                    </label>

                    <input
                      type="text"
                      value={
                        config.name
                      }
                      onChange={(event) =>
                        updatePrinter(
                          config.role,
                          'name',
                          event.target.value
                        )
                      }
                      className={`
                        w-full
                        rounded-xl
                        border
                        ${background.border}
                        px-3
                        py-2
                        text-sm
                        outline-none
                        focus:ring-2
                      `}
                      style={{
                        '--tw-ring-color':
                          theme.primaryLight,
                      } as React.CSSProperties}
                    />

                  </div>


                  {/* =================================================
                      CONNECTION
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-medium opacity-70">
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
                      ].map((option) => {

                        const OptionIcon =
                          option.icon;

                        const selected =
                          config.connectionType ===
                          option.key;


                        return (

                          <button
                            key={option.key}
                            type="button"
                            onClick={() =>
                              updatePrinter(
                                config.role,
                                'connectionType',
                                option.key
                              )
                            }
                            className={`
                              flex
                              flex-col
                              items-center
                              justify-center
                              rounded-xl
                              border
                              ${background.border}
                              px-3
                              py-3
                              text-xs
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

                            <OptionIcon
                              className="mb-1 h-5 w-5"
                            />

                            {option.key}

                          </button>

                        );

                      })}

                    </div>

                  </div>


                  {/* =================================================
                      PAPER
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-medium opacity-70">
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
                              updatePrinter(
                                config.role,
                                'paperSize',
                                size
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              ${background.border}
                              px-3
                              py-2
                              text-sm
                              font-medium
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
                      RENDER
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-medium opacity-70">
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
                              updatePrinter(
                                config.role,
                                'renderMode',
                                mode
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              ${background.border}
                              px-3
                              py-2
                              text-sm
                              font-medium
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
                      NETWORK
                  ================================================= */}

                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor:
                        theme.primaryLight,
                    }}
                  >

                    <p
                      className="mb-3 text-sm font-medium"
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

                        <label className="mb-1 block text-xs font-medium opacity-60">
                          IP Address
                        </label>

                        <input
                          type="text"
                          value={
                            config.ip
                          }
                          onChange={(event) =>
                            updatePrinter(
                              config.role,
                              'ip',
                              event.target.value
                            )
                          }
                          placeholder="192.168.1.100"
                          className={`
                            w-full
                            rounded-xl
                            border
                            ${background.border}
                            px-3
                            py-2
                            text-sm
                            outline-none
                            focus:ring-2
                          `}
                          style={{
                            '--tw-ring-color':
                              theme.primaryLight,
                          } as React.CSSProperties}
                        />

                      </div>


                      {/* PORT */}

                      <div>

                        <label className="mb-1 block text-xs font-medium opacity-60">
                          Port
                        </label>

                        <input
                          type="number"
                          value={
                            config.port
                          }
                          onChange={(event) =>
                            updatePrinter(
                              config.role,
                              'port',
                              Number(
                                event.target.value
                              )
                            )
                          }
                          className={`
                            w-full
                            rounded-xl
                            border
                            ${background.border}
                            px-3
                            py-2
                            text-sm
                            outline-none
                            focus:ring-2
                          `}
                          style={{
                            '--tw-ring-color':
                              theme.primaryLight,
                          } as React.CSSProperties}
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
                      disabled:opacity-50
                    "
                    style={{
                      backgroundColor:
                        theme.primary,
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
                    `}
                  >

                    <TestTube
                      className="h-4 w-4"
                    />

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
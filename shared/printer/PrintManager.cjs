const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const {
  BillImageFormatter80,
} = require('./formatters/BillImageFormatter80.cjs');

const {
  PrinterSettingsRepository,
} = require('./PrinterSettingsRepository.cjs');

const {
  FormatterFactory,
} = require('./formatters/FormatterFactory.cjs');

const {
  TransportFactory,
} = require('./transports/TransportFactory.cjs');

const {
  PrinterRole,
  ReceiptRenderMode,
} = require('./types.ts');

class PrintManager {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.settingsRepo = new PrinterSettingsRepository();
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  async enqueue(role, data, source = 'POS') {
    const jobId = crypto.randomUUID();

    const job = {
      id: jobId,
      role,
      data,
      createdAt: Date.now(),
      source,
    };

    this.queue.push(job);

    // start background processing
    this.processQueue().catch((e) => {
      console.error('Queue processing failed', e);
    });

    return jobId;
  }

  getQueueLength() {
    return this.queue.length;
  }

  // =====================================================
  // INTERNAL QUEUE PROCESSOR
  // =====================================================

  async processQueue() {
    if (this.processing) return;

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const job = this.queue.shift();

        if (!job) continue;

        await this.handleJob(job);
      }
    } finally {
      this.processing = false;
    }
  }

  // =====================================================
  // JOB HANDLER
  // =====================================================




  async handleJob(job) {
  // console.log(
  //   '\n========== PRINT JOB =========='
  // );

  // console.log(
  //   '[PRINT] Processing:',
  //   job.role,
  //   job.id
  // );

  // console.log(
  //   '[PRINT] DATA:',
  //   JSON.stringify(job.data, null, 2)
  // );

  const config =
    this.settingsRepo.getConfig(job.role);

  // console.log(
  //   '[PRINT] CONFIG:',
  //   JSON.stringify(config, null, 2)
  // );

  if (!config) {
    throw new Error(
      `Printer configuration not found for role ${job.role}`
    );
  }

  if (!config.enabled) {
    console.log(
      `[PRINT] Printer disabled for role ${job.role}`
    );
    return;
  }

  console.log(
    '[PRINT] Connection:',
    config.connectionType
  );

  console.log(
    '[PRINT] Address:',
    config.ip,
    config.port
  );

  console.log(
    '[PRINT] Paper:',
    config.paperSize
  );

  console.log(
    '[PRINT] Render:',
    config.renderMode
  );

  // =====================================================
  // TEXT MODE
  // =====================================================

  if (
    config.renderMode ===
    ReceiptRenderMode.TEXT
  ) {

    console.log(
      '[PRINT] Creating formatter for:',
      job.role
    );

    const formatter =
      FormatterFactory.create(
        job.role,
        config.paperSize
      );

    console.log(
      '[PRINT] Formatter created:',
      formatter?.constructor?.name
    );

    const text =
      formatter.format(
        job.data,
        config.paperSize
      );

    console.log(
      '[PRINT] FORMATTED TEXT:\n' +
      text
    );

    console.log(
      '[PRINT] Creating transport'
    );

    const transport =
      TransportFactory.create(config);

    console.log(
      '[PRINT] Transport created:',
      transport?.constructor?.name
    );

    console.log(
      '[PRINT] Sending to:',
      config.ip,
      config.port
    );

    const ok =
      await transport.printText(
        config,
        text
      );

    console.log(
      '[PRINT] Transport result:',
      ok
    );

    if (!ok) {
      throw new Error(
        'Text printing failed'
      );
    }

    console.log(
      `[PRINT] Text printed successfully for ${job.role}`
    );

    return;
  }

  // =====================================================
  // IMAGE MODE
  // =====================================================

  if (
    config.renderMode ===
    ReceiptRenderMode.IMAGE
  ) {
    console.log(
      `[PRINT] IMAGE mode requested for ${job.role}`
    );

    throw new Error(
      'Image printing not implemented yet'
    );
  }

  throw new Error(
    `Unsupported render mode: ${config.renderMode}`
  );
}




  // =====================================================
  // BILL IMAGE PREVIEW
  // =====================================================
  //
  // Generates the SAME PNG receipt as IMAGE mode,
  // but does NOT send anything to a printer.
  //
  // This is only for development/testing when
  // a thermal printer is not available.
  //
  async previewBillImage(data) {
    console.log(
      '\n========== BILL IMAGE PREVIEW =========='
    );

    try {
      console.log(
        '[PREVIEW] Generating bill image...'
      );

      const formatter =
        new BillImageFormatter80();

      const pngBuffer =
        await formatter.format(data);

      const previewDir =
        path.join(
          process.cwd(),
          'print-previews'
        );

      // Create directory if it does not exist
      if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(
          previewDir,
          {
            recursive: true,
          }
        );
      }

      const fileName =
        `bill-${Date.now()}.png`;

      const filePath =
        path.join(
          previewDir,
          fileName
        );

      fs.writeFileSync(
        filePath,
        pngBuffer
      );

      console.log(
        '[PREVIEW] PNG created:',
        filePath
      );

      return {
        success: true,
        filePath,
        fileName,
      };

    } catch (error) {

      console.error(
        '[PREVIEW] BILL IMAGE ERROR:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to generate bill image',
      };
    }
  }
  // =====================================================
  // CONVENIENCE METHODS
  // =====================================================

  async enqueueKitchen(data) {
    return this.enqueue(PrinterRole.KITCHEN, data);
  }

  async enqueueBill(data) {
    return this.enqueue(PrinterRole.BILL, data);
  }

  async enqueueBar(data) {
    return this.enqueue(PrinterRole.BAR, data);
  }
}

// Singleton instance
const printManager = new PrintManager();

module.exports = {
  PrintManager,
  printManager,
};
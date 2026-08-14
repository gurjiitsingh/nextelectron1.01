const crypto = require('crypto');

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
} = require('./types.js');

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
    console.log(
      `[PRINT] Processing ${job.role} job ${job.id}`
    );

    const config = this.settingsRepo.getConfig(job.role);

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

    // ---------------------------------------------
    // TEXT MODE
    // ---------------------------------------------
    if (config.renderMode === ReceiptRenderMode.TEXT) {
      const formatter = FormatterFactory.create(
        job.role,
        config.paperSize
      );

      const text = formatter.format(
        job.data,
        config.paperSize
      );

      const transport = TransportFactory.create(config);

      const ok = await transport.printText(config, text);

      if (!ok) {
        throw new Error('Text printing failed');
      }

      console.log(
        `[PRINT] Text printed successfully for ${job.role}`
      );

      return;
    }

    // ---------------------------------------------
    // IMAGE MODE (NEXT STEP)
    // ---------------------------------------------
    if (config.renderMode === ReceiptRenderMode.IMAGE) {
      throw new Error(
        'Image printing not implemented yet'
      );
    }

    throw new Error('Unsupported render mode');
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
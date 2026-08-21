'use client';

import { useState } from 'react';

export default function UploadOrderCounterButton() {
    const [loading, setLoading] = useState(false);

    async function handleUpload() {
        try {
            setLoading(true);

            console.log(
                'Calling window.posApi.uploadOrderCounter()...'
            );

            if (!window.posApi) {
                throw new Error(
                    'window.posApi is not available'
                );
            }

            if (
                typeof window.posApi.uploadOrderCounter !==
                'function'
            ) {
                throw new Error(
                    'window.posApi.uploadOrderCounter is not available'
                );
            }

            const res =
                await window.posApi.uploadOrderCounter();

            console.log(
                'ORDER COUNTER UPLOAD RESULT:',
                res
            );

            if (!res) {
                throw new Error(
                    'No response received from Electron'
                );
            }

            if (res.success) {
                alert(
                    `Uploaded successfully\n\n` +
                    `Doc: ${res.docId ?? '-'}\n` +
                    `Serial: ${res.invoiceSerialNo ?? '-'}`
                );

                return;
            }

            const errorMessage =
                res.error ||
               // res.message ||
                'Unknown upload error';

            console.error(
                'ORDER COUNTER UPLOAD FAILED:',
                errorMessage
            );

            alert(
                `Upload failed\n\nError:\n${errorMessage}`
            );
        } catch (error) {
            console.error(
                'ORDER COUNTER UPLOAD EXCEPTION:',
                error
            );

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            alert(
                `Upload failed\n\nError:\n${message}`
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
            {loading
                ? 'Uploading...'
                : 'Upload Order Counter'}
        </button>
    );
}
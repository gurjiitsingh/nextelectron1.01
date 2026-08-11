import { getVehicleLoadById } from '@/app/(universal)/action/production/distribution/vehicleLoad/getVehicleLoadById';
import AutoPrint from './AutoPrint';
import './print.css';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({
  params,
}: Props) {

  const { id } = await params;

  const load = await getVehicleLoadById(id);

  if (!load) {
    return <div className="p-6">Load not found</div>;
  }

  return (
    <div className="print-page">

      <AutoPrint />

      <div className="report">

        <div className="header w-full">
          <div className='w-full flex justify-between'>

            <div>
              <h1>Vehicle Load Report</h1>

              <p className="meta-line">
                <strong>Load No:</strong> {load.loadId}
              </p>

              <p className="meta-line">
                <strong>Date:</strong>{' '}
                {load.createdAt?.toDate
                  ? load.createdAt
                    .toDate()
                    .toLocaleString('en-IN')
                  : '-'}
              </p>
            </div>

            <div className="info-row">

              <div>
                <span className="label">Vehicle:</span>
                <span className="value">
                  {load.vehicleName}
                </span>
              </div>

              <div>
                <span className="value">
                  {load.responsiblePerson || '-'}
                </span>
              </div>

              <div>
                <span className="value">
                  {load.locationCode || '-'}
                </span>
              </div>

              <div>
                <span className="value success">
                  {load.status}
                </span>
              </div>

            </div>
          </div>
        </div>




        <table className="report-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit Cost</th>
              <th className="text-right">Value</th>
            </tr>
          </thead>

          <tbody>
            {load.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.productName}</td>
                <td className="text-right">
                  {item.quantity}
                </td>
                <td className="text-right">
                  ₹{Number(item.unitCost).toFixed(2)}
                </td>
                <td className="text-right">
                  ₹{Number(item.lineValue).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={2}>
                <strong>Total</strong>
              </td>

              <td className="text-right">
                <strong>{load.totalQuantity}</strong>
              </td>

              <td></td>

              <td className="text-right">
                <strong>
                  ₹{Number(load.totalValue).toFixed(2)}
                </strong>
              </td>
            </tr>
          </tfoot>

        </table>

        {load.remarks && (
          <div className="remarks">
            <div className="remarks-title">
              Remarks
            </div>
            <p>{load.remarks}</p>
          </div>
        )}

        <div className="signature-row">

          <div className="signature-box">
            <div className="line" />
            <div className="label">
              Prepared By
            </div>
          </div>

          <div className="signature-box">
            <div className="line" />
            <div className="label">
              Vehicle Incharge
            </div>
          </div>

          <div className="signature-box">
            <div className="line" />
            <div className="label">
              Manager
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
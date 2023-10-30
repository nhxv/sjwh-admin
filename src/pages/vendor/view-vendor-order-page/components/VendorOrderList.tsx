import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { Role } from "../../../../commons/enums/role.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import StatusTag from "../../../../components/StatusTag";
import { useAuthStore } from "../../../../stores/auth.store";

export default function VendorOrderList({ orders }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const onUpdateOrder = (code: string) => {
    navigate(`/vendor/draft-vendor-order/${code}`);
  };

  return (
    <>
      {orders.map((order) => {
        return (
          <div key={order.code} className="custom-card mb-8">
            {/* basic order info */}
            <div className="flex flex-row justify-between">
              <div>
                <div>
                  <span>#{order.code}</span>
                </div>
                <div>
                  <span className="text-xl font-semibold">
                    {order.vendorName}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-neutral">
                    Expected at {convertTime(new Date(order.expectedAt))}
                  </span>
                </div>
                <div className="mb-2">
                  <StatusTag status={order.status}></StatusTag>
                </div>
              </div>
            </div>
            <div className="divider"></div>
            {/* products in order */}
            <div className="mb-2 flex items-center">
              <div className="w-9/12">
                <span className="font-medium">Product</span>
              </div>
              <div className="w-3/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
            </div>
            {order.productVendorOrders.map((productOrder) => {
              return (
                <div
                  key={productOrder.productName}
                  className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-9/12">
                    <span>{productOrder.productName}</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>
                      {productOrder.quantity}{" "}
                      {productOrder.unitCode === "box"
                        ? ``
                        : `(${productOrder.unitCode})`}
                    </span>
                  </div>
                </div>
              );
            })}
            {order.status !== OrderStatus.COMPLETED &&
            (role === Role.MASTER || role === Role.ADMIN) ? (
              <>
                <div className="divider"></div>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => onUpdateOrder(order.code)}
                >
                  Update order
                </button>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </>
  );
}

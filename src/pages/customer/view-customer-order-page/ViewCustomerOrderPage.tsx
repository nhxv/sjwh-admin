import { useState, useEffect, useRef, StrictMode } from "react";
import api from "../../../stores/api";
import { OrderStatus } from "../../../commons/order-status.enum";
import SelectInput from "../../../components/forms/SelectInput";
import Spinner from "../../../components/Spinner";
import { BiError, BiBot, BiLayer, BiDownload } from "react-icons/bi"; 
import CustomerOrderList from "./components/CustomerOrderList";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import { useAuthStore } from "../../../stores/auth.store";
import { Role } from "../../../commons/role.enum";
import { useReactToPrint } from "react-to-print";
import PackingSlipToPrint from "./components/PackingSlipToPrint";

export default function ViewCustomerOrderPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [customerOrderList, setCustomerOrderList] = useState([]);
  const role = useAuthStore((state) => state.role);
  const batchToPrintRef = useRef<HTMLDivElement>(null);
  const handleBatchPrint = useReactToPrint({
    content: () => batchToPrintRef.current,
  });

  useEffect(() => {
    getCustomerOrders();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getCustomerOrders();
    }, 60000);

    return () => {
      clearInterval(reRender);
    }
  }, [status]);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => (
        {...prev, listLoading: false}
      ));
    }
  }, [customerOrderList]);

  const getCustomerOrders = () => {
    api.get(`/customer-orders/basic-list/${status}`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false,
        }));
      }
      setCustomerOrderList(res.data);
    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setListState(prev => (
        {...prev, listError: error.message, listLoading: false}
      ));
    });
  }

  const onSelect = (e) => {
    setStatus(e.target.value);
    setListState({listError: "", listEmpty: "", listLoading: true});
  }

  const onBatchPrint = () => {
    handleBatchPrint();
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  const setStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === OrderStatus.PICKING) {
      setStatus(OrderStatus.PICKING);
    } else if (s === OrderStatus.CHECKING) {
      setStatus(OrderStatus.CHECKING);
    } else if (s === OrderStatus.SHIPPING) {
      setStatus(OrderStatus.SHIPPING);
    } else if (s === OrderStatus.DELIVERED) {
      setStatus(OrderStatus.DELIVERED);
    }
    if (s !== status) {
      setListState({listError: "", listEmpty: "", listLoading: true});
    }
  }

  const checkStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === status) {
      return true;
    } else if (s === OrderStatus.PICKING) {
      return true;
    } else if (
      s === OrderStatus.CHECKING && 
      (status === OrderStatus.SHIPPING || status === OrderStatus.DELIVERED)) {
      return true;
    } else if (s === OrderStatus.SHIPPING && status === OrderStatus.DELIVERED) {
      return true;
    }
    return false;
  }

  return (
    <>
      <section className="min-h-screen">
        <div className="flex flex-col items-center">
          <div className={`my-6 w-11/12 sm:w-8/12 md:w-6/12 flex justify-center`}>
            <div className="w-11/12">
              {/* <SelectInput name="status" id="status" 
              options={Object.values(OrderStatus).filter(
                status => status !== OrderStatus.CANCELED && status !== OrderStatus.COMPLETED
              )}
              onChange={onSelect}
              value={status}
              ></SelectInput> */}
              <ul className="steps w-full">
                {Object.values(OrderStatus)
                .filter(s => s !== OrderStatus.CANCELED && s !== OrderStatus.COMPLETED)
                .map((s) => (
                <li key={s} className={`cursor-pointer step text-sm font-medium 
                  ${checkStep(s) ? "text-primary step-primary" : ""}`}
                  onClick={() => setStep(s)}
                >{capitalizeFirst(s.toLowerCase())}</li>
                ))}
              </ul>
            </div>
          </div>
          {(role === Role.ADMIN || role === Role.MASTER) ? (
          <div className="hidden">
            <div ref={batchToPrintRef}>
              {customerOrderList.map((order, index) => (
              <div key={`customer-order-${index}`}>
                <PackingSlipToPrint printRef={null} order={order} />
              </div>
              ))}
            </div>
          </div>      
          ): (<></>)}

          {listState.listLoading ? (
          <>
            <div className="flex justify-center">
              <Spinner></Spinner>
            </div>            
          </>
          ) : (
          <>
            {listState.listError ? (
            <>
            <div className="w-11/12 sm:w-8/12 md:w-6/12 alert alert-error text-red-700 flex justify-center">
              <div>
                <BiError className="flex-shrink-0 w-6 h-6"></BiError>
                <span>{listState.listError}</span>
              </div>
            </div>              
            </>
            ) : (
            <>
              {listState.listEmpty ? (
              <>
                <div className="w-11/12 sm:w-8/12 md:w-6/12 alert bg-gray-300 text-black flex justify-center">
                  <div>
                    <BiBot className="flex-shrink-0 w-6 h-6"></BiBot>
                    <span>{listState.listEmpty}</span>
                  </div>
                </div>                
              </>
              ) : (
              <>
              <div className="w-11/12 sm:w-8/12 md:w-6/12">
                <CustomerOrderList orders={customerOrderList} printMode={(role === Role.ADMIN || role === Role.MASTER) && status !== OrderStatus.COMPLETED ? true : false} />
                {(role === Role.ADMIN || role === Role.MASTER) &&
                (!listState.listEmpty && !listState.listError && !listState.listLoading) ? (         
                <div className="flex justify-center mb-6">
                  <button type="button" className="btn btn-accent text-black" onClick={onBatchPrint}>
                    <span className="mr-2">Print all orders</span>
                    <BiLayer className="w-6 h-6"></BiLayer>
                  </button>
                </div>
                ): (<></>)}
              </div>
              </>
              )}
            </>
            )}
          </>)}    
        </div>
      </section>
    </>
  )
}
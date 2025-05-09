import VendorOrderDetail from "./components/VendorOrderDetail";

export default function VendorOrderDetailPage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
          <VendorOrderDetail></VendorOrderDetail>
        </div>
      </div>
    </section>
  );
}

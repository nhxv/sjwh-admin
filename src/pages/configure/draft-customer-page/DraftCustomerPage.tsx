import CustomerFormContainer from "./components/CustomerFormContainer";

export default function DraftCustomerPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Draft customer</h1>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-10/12 lg:w-6/12">
          <CustomerFormContainer></CustomerFormContainer>
        </div>
      </div>
    </section>
  );
}

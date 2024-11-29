
const Complete = ({ productDetails, supplierDetails }) => {
  return (
    <div>
      <h6 className="font-semibold lg:text-3xl md:text-xl text-lg tracking-wider text-gray-500">
        Confirmation
      </h6>
      <p className="text-gray-600 mt-2 md:text-base text-xs">
        Please review the details below before completing the process.
      </p>
      <div className="mt-5">
        <h5 className="font-semibold md:text-xl text-lg">Product Details</h5>
        <div className="mt-2 space-y-2">
          <p>
            <strong>Product ID:</strong> {productDetails.productID || "N/A"}
          </p>
          <p>
            <strong>Product Name:</strong> {productDetails.productName || "N/A"}
          </p>
          <p>
            <strong>Quantity:</strong> {productDetails.productQuantity || "N/A"}
          </p>
          <p>
            <strong>Price:</strong> Rs {productDetails.productPrice || "N/A"}
          </p>
          <p>
            <strong>Company Name:</strong> {productDetails.companyName || "N/A"}
          </p>
        </div>
      </div>

      {/* Supplier Details Summary */}
      <div className="mt-8">
        <h5 className="font-semibold md:text-xl text-lg">Supplier Details</h5>
        <div className="mt-2 space-y-2">
          <p>
            <strong>Supplier ID:</strong> {supplierDetails.supplierID || "N/A"}
          </p>
          <p>
            <strong>Supplier Name:</strong>{" "}
            {supplierDetails.supplierName || "N/A"}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <p className="text-green-600 font-semibold">
          Everything looks good! Click **Save** to finalize.
        </p>
      </div>
    </div>
  );
};

export default Complete;

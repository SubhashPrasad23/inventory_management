import React, { memo } from "react";

const SupplierDetails = ({ Details, handleChange }) => {

  return (
    <div>
      <h6 className="font-semibold lg:text-3xl md:text-xl text-lg tracking-wider text-gray-500">
        Supplier Details
      </h6>
      <div className="grid lg:grid-cols-2 lg:gap-5 gap-3 mt-5">
        <input
          type="text"
          placeholder="Supplier ID"
          value={Details.supplierID}
          name="supplierID"
          onChange={handleChange}
          className="border md:p-3 p-2 rounded-lg focus:outline-none focus:border-blue-400 focus:border-2 shadow-sm"
        />
        <input
          type="text"
          placeholder="Supplier Name"
          value={Details.supplierName}
          name="supplierName"
          onChange={handleChange}
          className="border md:p-3 p-2 rounded-lg focus:outline-none focus:border-blue-400 focus:border-2 shadow-sm"
        />
      </div>
    </div>
  );
};

export default memo(SupplierDetails);

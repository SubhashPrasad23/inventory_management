import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Stepper = ({
  stepsConfig = [],
  handlerSave,
  productDetails,
  supplierDetails,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  const { productID, productName, productQuantity, productPrice, companyName } =
    productDetails;

  const { supplierID, supplierName } = supplierDetails;

  const handleNext = () => {
    if (currentStep === 1) {
      if (
        !productID ||
        !productName ||
        !productQuantity ||
        !productPrice ||
        !companyName
      ) {
         toast.error("Please fill in all fields correctly.");
        return;
      }
    }

    if (currentStep === 2) {
      if (!supplierID || !supplierName) {
             toast.error("Please fill in all fields correctly.");

        return;
      }
    }

    setCurrentStep((prev) => {
      if (prev === stepsConfig.length) {
        setIsComplete(true);
        return prev;
      } else {
        return prev + 1;
      }
    });
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  if (!stepsConfig.length) {
    return <></>;
  }

  const CalculateProgressBarWidth = () => {
    return ((currentStep - 1) / (stepsConfig.length - 1)) * 100;
  };

  return (
    <>
      <div className="relative flex items-center justify-between mb-4">
        {stepsConfig.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center transition-all duration-300 ease-in-out"
          >
            <div
              className={`flex items-center justify-center md:text-lg text-sm font-semibold md:h-12 md:w-12 h-9 w-9  rounded-full z-20  ${
                currentStep > index + 1 || isComplete
                  ? "bg-green-500"
                  : currentStep === index + 1
                  ? "bg-violet-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {currentStep > index + 1 || isComplete ? (
                <span className="text-white">&#10003;</span>
              ) : (
                index + 1
              )}
            </div>
            <div className="  space-x-5 xl:text-xl  md:text-lg  text-[9px] font-semibold tracking-wider">
              {step.name}
            </div>
          </div>
        ))}

        <div className="absolute md:top-6 top-5 inset-x-0  transform -translate-y-1/2 bg-gray-300 w-full h-2">
          <div
            className="h-full bg-green-500 transition-all duration-300 ease-in-out"
            style={{ width: `${CalculateProgressBarWidth()}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-16">
        {stepsConfig.map((step, index) => (
          <div
            key={index}
            className={`${currentStep === index + 1 ? "block" : "hidden"}`}
          >
            {step.component}
          </div>
        ))}
      </div>

      <div
        className={`flex w-full mt-4 ${
          currentStep === stepsConfig.length
            ? "justify-center "
            : "justify-between"
        }`}
      >
        <button
          className={`btn bg-gray-500 text-white md:px-4 md:py-2 px-2.5 py-1 rounded disabled:opacity-50 ${
            currentStep === stepsConfig.length && "hidden"
          }`}
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </button>

        {!isComplete && currentStep === stepsConfig.length ? (
          <button
            className="btn bg-violet-500 text-white md:px-6 md:py-2 px-4 py-1 rounded"
            onClick={handlerSave}
          >
            save
          </button>
        ) : (
          <div>
            <button
              className="btn  bg-violet-500 text-white md:px-4 md:py-2 px-2.5 py-1 rounded"
              onClick={handleNext}
            >
              Next
            </button>
            <ToastContainer autoClose={2000} />
          </div>
        )}
      </div>
    </>
  );
};

export default Stepper;

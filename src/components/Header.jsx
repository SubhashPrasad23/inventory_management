
const Header = () => {
  return (
    <div className="2xl:w-10/12  lg:w-9/12 sm:w-4/6 w-[85%] shadow-2xl  flex items-end justify-between p-3 fixed backdrop-blur-md   z-50">
      <h4 className="font-semibold lg:text-2xl md:text-lg md:text-md text-sm">
        Products
      </h4>
      <div className="">
        <div className="font-semibold uppercase md:text-sm text-xs">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
        <div className="md:text-sm text-xs">
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default Header
const Loading = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-[3px] border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;

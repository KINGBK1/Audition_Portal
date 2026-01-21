import React from "react";

const Loader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-50">
            <div className="w-16 h-16 border-t-4 border-slate-300 border-solid rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;

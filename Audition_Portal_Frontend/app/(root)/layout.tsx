import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            {children}
        </div>
    );
};

export default Layout;
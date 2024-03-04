import Sidebar from '@/components/Shared/Sidebar'
import React from 'react'

const Layout = ({ children } : {children: React.ReactNode}) => {
  return (
    <main className='root'>
        <Sidebar/>

        {/* Mobile Navigation */}
        <div className='root-container'>
            <div className='wrapper'>
                {children}
            </div>
        </div> 
    </main>
  )
}

export default Layout
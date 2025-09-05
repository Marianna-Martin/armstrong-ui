import React from 'react';
     import './index.css';
     import Dashboard from './components/Dashboard';

     function App() {
       return (
         <div className="min-h-screen">
           <header>
             <div className="container">
               <h1>Armstrong Number App</h1>
             </div>
           </header>
           <main className="container">
             <Dashboard />
           </main>
         </div>
       );
     }

     export default App;
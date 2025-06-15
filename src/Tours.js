import React from 'react';
import ToursApp from './ToursApp';

const Tours = () => {
  console.log('Tours component is rendering!');
  
  
  return (
    <div className='tours-body'>
      <ToursApp />
    </div>
  );
};

export default Tours;
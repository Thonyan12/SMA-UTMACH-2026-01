import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type, count = 1 }) => {
  const classes = `skeleton ${type}`;
  const skeletons = Array(count).fill(0).map((_, i) => (
    <div key={i} className={classes}></div>
  ));
  
  return <>{skeletons}</>;
};

export default Skeleton;

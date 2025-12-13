import React from 'react';
import image from '../image.png';
import { AiOutlineMenu } from "react-icons/ai";

const Navbar = ({setToggleClick}) => {
  
  return (
    <div className='border-bottom font-serif w-full'>
      <nav className="p-1 flex flex-row items-center justify-between border-2 border-b-4 border-grey border-b-orange">
        <div className="flex items-center md:space-x-4 ">
          <button className="px-5 border-r-2" onClick={()=>setToggleClick(prev=>!prev)} >
          <AiOutlineMenu className='text-gray-400 text-2xl' />
          </button>
          <a href="https://www.vlab.co.in/">
            <img src={image} width="120px" className="" alt="Logo" />
          </a>
        </div>
        <div className="hidden md:flex">
          <ul className="flex flex-row space-x-5">
            <li><a href="https://www.vlab.co.in/" className="font-serif text-blue  hover:text-orange hover:underline p-5 ">HOME</a></li>
            <li><a href="https://www.vlab.co.in/participating-institutes" className="p-5 font-serif  text-blue  hover:text-orange hover:underline">PARTNERS</a></li>
            <li><a href="https://www.vlab.co.in/" className="p-5 font-serif text-blue  hover:text-orange hover:underline">CONTACT</a></li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
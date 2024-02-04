import React from "react";
import { IoPartlySunnyOutline } from "react-icons/io5";
import { MdOutlineMyLocation, MdOutlineLocationOn } from "react-icons/md";
import SearchBox from "./SearchBox";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white">
      <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
        <p className="flex items-center justify-center gap-2">
          <span className="text-gray-500 text-3xl">Weather</span>
          <IoPartlySunnyOutline className="text-3xl mt-1 text-yellow-300" />
        </p>

        {/* search functionality */}
        <section className="flex gap-2 items-center">
          <MdOutlineMyLocation className="text-2xl text-gray-400 hover:opacity-80 cursor-pointer" />
          <MdOutlineLocationOn className="text-3xl text-gray-400 hover:opacity-80" />
          <p className="text-slate-900/80 text-sm">Kiserian</p>
          <div>
            {/* Search Box */}
            <SearchBox />
          </div>
        </section>
      </div>
    </nav>
  );
};

export default Navbar;

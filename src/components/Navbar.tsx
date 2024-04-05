"use client";
import React, { useState } from "react";
import { IoPartlySunnyOutline } from "react-icons/io5";
import { MdOutlineMyLocation, MdOutlineLocationOn } from "react-icons/md";
import SearchBox from "./SearchBox";
import axios from "axios";
import { useAtom } from "jotai";
import { loadCityAtom, placeAtom } from "@/app/atom";

type Props = { location?: string };

const apiKey = process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY;

const SuggestionBox = ({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error,
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) => {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1">{error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              className="cursor-pointer p-1 rounded hover:bg-gray-2000"
              onClick={() => handleSuggestionClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

const Navbar = ({ location }: Props) => {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  // state for showing suggestions on Search Box
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  //default city on app load
  const [place, setFirstPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadCityAtom);

  const handleSearchInput = async (value: string) => {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${apiKey}`
        );
        const suggestion = response.data.list.map((item: any) => item.name);
        setSuggestions(suggestion);
        setError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (value: string) => {
    setCity(value);
    setShowSuggestions(false);
  };

  const handleSubmitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    setLoadingCity(true);
    e.preventDefault();
    if (suggestions.length == 0) {
      setError("Location Not Found");
      setLoadingCity(false);
    } else {
      setError("");
      setTimeout(() => {
        setLoadingCity(false);
        setFirstPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  };

  // get your current location
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setFirstPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  };

  return (
    <>
      <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white">
        <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
          <p className="flex items-center justify-center gap-2">
            <span className="text-gray-500 text-3xl">Weather</span>
            <IoPartlySunnyOutline className="text-3xl mt-1 text-yellow-300" />
          </p>

          {/* search functionality */}
          <section className="flex gap-2 items-center">
            <MdOutlineMyLocation
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-2xl text-gray-400 hover:opacity-80 cursor-pointer"
            />
            <MdOutlineLocationOn className="text-3xl text-gray-400 hover:opacity-80" />
            <p className="text-slate-900/80 text-sm">{location}</p>
            <div className="relative text-gray-500 hidden md:flex">
              {/* Search Box */}
              <SearchBox
                value={city}
                onSubmit={handleSubmitSearch}
                onChange={(e) => handleSearchInput(e.target.value)}
              />
              <SuggestionBox
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error,
                }}
              />
            </div>
          </section>
        </div>
      </nav>
      <section className="flex max-w-7xl px-3 md:hidden">
        <div className="relative text-gray-500">
          {/* Search Box */}
          <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
          <SuggestionBox
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionClick,
              error,
            }}
          />
        </div>
      </section>
    </>
  );
};

export default Navbar;

import Image from "next/image";
import InfluencerUploader from "./components/InfluencerUploader";
//https://script.google.com/macros/s/AKfycbwP88F4_lmSzUm_O97dSe0MIAJlxQkxR0xnxxysbNCcDXXBoEJ0LGM9Gbg3zcFlgSgRZw/exec
  //AKfycbwP88F4_lmSzUm_O97dSe0MIAJlxQkxR0xnxxysbNCcDXXBoEJ0LGM9Gbg3zcFlgSgRZw
//https://docs.google.com/spreadsheets/d/e/2PACX-1vRYSLbOEykFK1SEIpu4P_AKVFzCY86MJqRWdNFgQfCt66eb9Jv88rNSHPko_zWNdvNBkR47ybnDmVU9/pub?gid=0&single=true&output=csv
export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
    <InfluencerUploader />
    </main>
  );
}

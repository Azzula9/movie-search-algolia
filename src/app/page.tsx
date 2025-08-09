

import Search from "@/components/algolia/Search";
export default function Home() {
  return (
    <div className="bg-white flex-col flex items-center w-full h-full justify-center gap-8 p-8">
      <h1 className="font-bol text-[40px]">Next js search with algolia</h1>
      <Search />
      {/* the data and the pagination will goes here */}
    </div>
  );
}

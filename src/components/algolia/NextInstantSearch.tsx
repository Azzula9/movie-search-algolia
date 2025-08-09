import { InstantSearch, InstantSearchProps } from "react-instantsearch";

interface NextInstantSearchProps extends InstantSearchProps {
    children: React.ReactNode
}



export function NextInstantSearch(props:NextInstantSearchProps) {
    return InstantSearch(props) as React.ReactNode
}
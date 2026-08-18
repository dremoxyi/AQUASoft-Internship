import Navbar from "../../../shared/ui/navbar/Navbar"
import SearchResults from "../../search/components/SearchResults"

export default function HomePage(){
    return(
        <>
            <Navbar showSearch={true} />
            <SearchResults />
        </>
    )
}
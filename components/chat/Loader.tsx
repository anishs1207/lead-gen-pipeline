import { Loader } from "@/components/ui/loader";

export function LoaderBasic() {
    return (
        <div className="flex w-full flex-col space-y-8 p-4">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">

                <div
                    className="flex flex-col items-center justify-center gap-2 p-4"
                >
                    <Loader variant={"text-shimmer"} />
                </div>

            </div>
        </div>
    )
}
import { Outlet } from "react-router-dom";
import { ProductivityWidget } from "../features/widget/components/ProductivityWidget";
import { WidgetMediaProvider } from "../features/widget/context/WidgetMediaProvider";

export function AppLayout(){
    return (
        <WidgetMediaProvider>
            <div className="relative min-h-screen w-full bg-gray-50">
                <Outlet />
                <ProductivityWidget />
            </div>
        </WidgetMediaProvider>
    )
}
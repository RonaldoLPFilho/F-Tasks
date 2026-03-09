import { Outlet } from "react-router-dom";
import { ProductivityWidget } from "../features/widget/components/ProductivityWidget";
import { WidgetMediaProvider } from "../features/widget/context/WidgetMediaProvider";

export function AppLayout(){
    return (
        <WidgetMediaProvider>
            <div className="relative">
                <Outlet />
                <ProductivityWidget />
            </div>
        </WidgetMediaProvider>
    )
}
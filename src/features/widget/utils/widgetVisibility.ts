const HIDDEN_WIDGET_ROUTE_PREFIXES = ["/login", "/register", "/reset-password"];

export function shouldHideWidget(pathname: string) {
  return HIDDEN_WIDGET_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

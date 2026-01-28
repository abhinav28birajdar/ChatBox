import { Redirect } from "expo-router";

export default function RootIndex() {
    // In a real app, logic here would check for auth or first-run
    const isFirstRun = true;

    if (isFirstRun) {
        return <Redirect href="/onboarding/welcome" />;
    }

    return <Redirect href="/(auth)/login" />;
}

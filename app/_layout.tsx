/* FILE:          CliqueApp/app/layout.tsx
   LAST UPDATED:  2025-04-23
   PURPOSE:       Defines the root layout shared across all app screens (used by expo-router)
   BEHAVIOR:      Wraps all pages with custom font setup and suppresses default splash
   NOTES:         Gloabl layout stuff like fonts, SafeArea, and app-wide providers go here
**************************************************************************************************/
import { MemoryProvider } from './_context/MemoryContext'


import { Slot } from 'expo-router'          // show correct screen from curr route
import { useFonts } from 'expo-font'        // loads custom fonts
import { SplashScreen } from 'expo-router'  // hides default splash screen
import { useEffect } from 'react';          // run code when app mounts



export default function Layout() {
  const [fontsLoaded] = useFonts({
  'Gaegu-Regular': require('../assets/fonts/Gaegu-Regular.ttf'),
  'Gaegu-Bold': require('../assets/fonts/Gaegu-Bold.ttf'),
  'Gaegu-Light': require('../assets/fonts/Gaegu-Light.ttf'),

  'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
  'Outfit-Bold': require('../assets/fonts/Outfit-Bold.ttf'),
  'Outfit-Light': require('../assets/fonts/Outfit-Light.ttf'),
  'Outfit-Medium': require('../assets/fonts/Outfit-Medium.ttf'),
  'Outfit-SemiBold': require('../assets/fonts/Outfit-SemiBold.ttf'),
  'Outfit-ExtraBold': require('../assets/fonts/Outfit-ExtraBold.ttf'),
  'Outfit-Thin': require('../assets/fonts/Outfit-Thin.ttf'),
  'Outfit-Black': require('../assets/fonts/Outfit-Black.ttf'),

  'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
  'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
  'Figtree-Light': require('../assets/fonts/Figtree-Light.ttf'),
  'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
  'Figtree-ExtraBold': require('../assets/fonts/Figtree-ExtraBold.ttf'),

  'Manjari-Regular': require('../assets/fonts/Manjari-Regular.ttf'),
  'Manjari-Bold': require('../assets/fonts/Manjari-Bold.ttf'),
  'Manjari-Thin': require('../assets/fonts/Manjari-Thin.ttf'), 
  });


  /* Hide splash screen ONLY after out fonts are done loading */
  useEffect(() => 
  { if (fontsLoaded) { SplashScreen.hideAsync();} }, [fontsLoaded]);
  if (!fontsLoaded)  // if still loading, don't show anything yet.
  { return null;}

  /* THIS RETURNS THE ACTUAL SCREEN, LIKE A WRAPPER FOR EVERY PAGE IN THE APP */ 
  return (
    <MemoryProvider>
      <Slot />
    </MemoryProvider>
   )
}

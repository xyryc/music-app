import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome screen
    router.replace('/welcome');
  }, [router]);

  return null;
}

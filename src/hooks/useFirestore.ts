import { useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    query,
    QueryConstraint,
    QuerySnapshot,
    DocumentSnapshot,
    doc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestoreCollection<T>(path: string, constraints: QueryConstraint[] = []) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, path), ...constraints);

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            setData(items);
            setLoading(false);
        }, (err) => {
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
        // constraints are intentionally omitted from deps — callers should
        // stabilize the array with useMemo to avoid infinite subscription loops.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path]);

    return { data, loading, error };
}

export function useFirestoreDoc<T>(path: string, id: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        const unsubscribe = onSnapshot(doc(db, path, id), (snapshot: DocumentSnapshot) => {
            if (snapshot.exists()) {
                setData({ id: snapshot.id, ...snapshot.data() } as T);
            } else {
                setData(null);
            }
            setLoading(false);
        }, (err) => {
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [path, id]);

    return { data, loading, error };
}

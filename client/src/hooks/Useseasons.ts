// Path: ranch-tracker/client/src/hooks/Useseasons.ts

import { useState, useCallback } from 'react';
import api from '../lib/api';
import type { CropSeason, SeasonExpense, SeasonResource, YieldEntry } from '../types/index';

export function useSeasons() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchSeasonsByCrop = useCallback(async (cropId: string): Promise<CropSeason[]> => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: CropSeason[] }>(`/agriculture/crops/${cropId}/seasons`);
      return res.data.data ?? [];
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch seasons');
      return [];
    } finally { setLoading(false); }
  }, []);

  const fetchSeasonById = useCallback(async (seasonId: string): Promise<CropSeason | null> => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: CropSeason }>(`/agriculture/seasons/${seasonId}`);
      return res.data.data;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch season');
      return null;
    } finally { setLoading(false); }
  }, []);

  const createSeason = useCallback(async (data: Partial<CropSeason>): Promise<CropSeason | null> => {
    setLoading(true); setError(null);
    try {
      const res = await api.post<{ data: CropSeason }>('/agriculture/seasons', data);
      return res.data.data;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create season');
      return null;
    } finally { setLoading(false); }
  }, []);

  const updateSeason = useCallback(async (seasonId: string, data: Partial<CropSeason>): Promise<CropSeason | null> => {
    setLoading(true); setError(null);
    try {
      const res = await api.put<{ data: CropSeason }>(`/agriculture/seasons/${seasonId}`, data);
      return res.data.data;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update season');
      return null;
    } finally { setLoading(false); }
  }, []);

  const deleteSeason = useCallback(async (seasonId: string): Promise<boolean> => {
    setLoading(true);
    try {
      await api.delete(`/agriculture/seasons/${seasonId}`);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete season');
      return false;
    } finally { setLoading(false); }
  }, []);

  const fetchExpenses = useCallback(async (seasonId: string): Promise<SeasonExpense[]> => {
    try {
      const res = await api.get<{ data: SeasonExpense[] }>(`/agriculture/seasons/${seasonId}/expenses`);
      return res.data.data ?? [];
    } catch { return []; }
  }, []);

  const addExpense = useCallback(async (seasonId: string, data: Partial<SeasonExpense>): Promise<SeasonExpense | null> => {
    try {
      const res = await api.post<{ data: SeasonExpense }>(`/agriculture/seasons/${seasonId}/expenses`, data);
      return res.data.data;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add expense');
      return null;
    }
  }, []);

  const deleteExpense = useCallback(async (seasonId: string, expenseId: string): Promise<boolean> => {
    try {
      await api.delete(`/agriculture/seasons/${seasonId}/expenses/${expenseId}`);
      return true;
    } catch { return false; }
  }, []);

  const fetchResources = useCallback(async (seasonId: string): Promise<SeasonResource[]> => {
    try {
      const res = await api.get<{ data: SeasonResource[] }>(`/agriculture/seasons/${seasonId}/resources`);
      return res.data.data ?? [];
    } catch { return []; }
  }, []);

  const addResource = useCallback(async (seasonId: string, data: Partial<SeasonResource>): Promise<SeasonResource | null> => {
    try {
      const res = await api.post<{ data: SeasonResource }>(`/agriculture/seasons/${seasonId}/resources`, data);
      return res.data.data;
    } catch { return null; }
  }, []);

  const deleteResource = useCallback(async (seasonId: string, resourceId: string): Promise<boolean> => {
    try {
      await api.delete(`/agriculture/seasons/${seasonId}/resources/${resourceId}`);
      return true;
    } catch { return false; }
  }, []);

  const fetchYields = useCallback(async (seasonId: string): Promise<YieldEntry[]> => {
    try {
      const res = await api.get<{ data: YieldEntry[] }>(`/agriculture/seasons/${seasonId}/yields`);
      return res.data.data ?? [];
    } catch { return []; }
  }, []);

  const addYield = useCallback(async (seasonId: string, data: Partial<YieldEntry>): Promise<YieldEntry | null> => {
    try {
      const res = await api.post<{ data: YieldEntry }>(`/agriculture/seasons/${seasonId}/yields`, data);
      return res.data.data;
    } catch { return null; }
  }, []);

  const deleteYield = useCallback(async (seasonId: string, yieldId: string): Promise<boolean> => {
    try {
      await api.delete(`/agriculture/seasons/${seasonId}/yields/${yieldId}`);
      return true;
    } catch { return false; }
  }, []);

  return {
    loading, error,
    fetchSeasonsByCrop, fetchSeasonById,
    createSeason, updateSeason, deleteSeason,
    fetchExpenses, addExpense, deleteExpense,
    fetchResources, addResource, deleteResource,
    fetchYields, addYield, deleteYield,
  };
}
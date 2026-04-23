import { create } from 'zustand';
import type { Machine, Part } from '../types';
import {
  getAllMachines,
  getMachineById,
  insertMachine,
  updateMachine as dbUpdateMachine,
  deleteMachine as dbDeleteMachine,
} from '../database/machines';
import { deletePhotos } from '../utils/fileSystem';

type MachineStore = {
  machines: Machine[];
  loading: boolean;

  loadMachines: () => void;
  addMachine: (data: {
    name: string;
    description?: string;
    photos?: string[];
  }) => number;
  updateMachine: (
    id: number,
    data: {
      name?: string;
      description?: string;
      photos?: string[];
      parts?: Part[];
    }
  ) => void;
  removeMachine: (id: number) => Promise<void>;
  getMachine: (id: number) => Machine | null;
};

export const useMachineStore = create<MachineStore>((set, get) => ({
  machines: [],
  loading: false,

  loadMachines: () => {
    set({ loading: true });
    const machines = getAllMachines();
    set({ machines, loading: false });
  },

  addMachine: (data) => {
    const id = insertMachine(data);
    get().loadMachines();
    return id;
  },

  updateMachine: (id, data) => {
    dbUpdateMachine(id, data);
    get().loadMachines();
  },

  removeMachine: async (id) => {
    const machine = getMachineById(id);
    if (machine) {
      const allPhotos = [
        ...machine.photos,
        ...machine.parts.flatMap((p) => p.photos),
      ];
      await deletePhotos(allPhotos);
      dbDeleteMachine(id);
      get().loadMachines();
    }
  },

  getMachine: (id) => {
    return getMachineById(id);
  },
}));

import { Crown, Percent, QrCode, RefreshCw, Star, Ticket, Users } from 'lucide-react-native';
import React, { createContext, useContext, useMemo } from 'react';
import { GET_PROGRAMS, useQuery } from '../api/client';

const iconMap = {
  RefreshCw,
  Ticket,
  Star,
  QrCode,
  Percent,
  Crown,
  Users
};

const ProgramContext = createContext({});

export const usePrograms = () => useContext(ProgramContext);

export const ProgramProvider = ({ children }) => {
  const { data, loading, refetch } = useQuery(GET_PROGRAMS);

  // Here we would use mock mutations if we wanted to mimic network updates 
  // For now, we update via refetch or similar mocks if needed
  // Since we haven't mapped UPDATE_PROGRAM or ADD_PROGRAM in graphqlMock yet, we can stub them
  // or just directly update the db under the hood and refetch (to keep the mock simple).

  const programs = useMemo(() => {
    if (!data?.programs) return [];
    return data.programs.map(p => ({
      ...p,
      icon: iconMap[p.icon] || Star
    }));
  }, [data]);

  const updateProgram = async (updatedProgram) => {
    // A mutation call would go here: await updateProgramMutation(...)
    // For this mock, we can just log
    console.log("Mocking update program...", updatedProgram);
  };

  const addProgram = async (newProgram) => {
    console.log("Mocking add program...", newProgram);
  };

  return (
    <ProgramContext.Provider value={{
      programs,
      updateProgram,
      addProgram,
      loading
    }}>
      {children}
    </ProgramContext.Provider>
  );
};
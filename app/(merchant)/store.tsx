import React from 'react';
import { usePrograms } from '../../contexts/ProgramContext';
import MerchantStore from '../../screens/merchant/MerchantStore';

export default function StorePage() {
    const { programs, updateProgram } = usePrograms();

    return (
        <MerchantStore
            programs={programs}
            onUpdateProgram={updateProgram}
        />
    );
}

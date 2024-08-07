import React, { useState } from 'react';

const useTextarea = (initialValue) => {
    const [value, setValue] = useState(initialValue);
    const onChangeValue = (e) => {
        return setValue(e.target.value);
    };

    return [value, setValue, onChangeValue];
};

export default useTextarea;
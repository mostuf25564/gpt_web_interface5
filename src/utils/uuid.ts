export function generateUUID(): string {
    const array: Uint8Array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Set the version to 0100 (Version 4 UUID)
    array[6] = (array[6] & 0x0f) | 0x40; 
    // Set bits 6-7 to 10
    array[8] = (array[8] & 0x3f) | 0x80; 
    
    const uuid: string = [...array].map((byte: number, index: number) => {
        const hex: string = byte.toString(16).padStart(2, '0');
        return (index === 4 || index === 6 || index === 8 || index === 10) ? `-${hex}` : hex;
    }).join('');
    
    return uuid;
}
 
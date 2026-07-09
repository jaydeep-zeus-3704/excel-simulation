export const getClosest = (
    target: number,
    arr: number[]
): number => {

    let left = 0;
    let right = arr.length - 1;
    let answer = 0;

    while (left <= right) {

        const mid = Math.floor(
            left + (right - left) / 2
        );

        const midElement = arr[mid]!;

        if (midElement <= target) {
            answer = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return answer;
};
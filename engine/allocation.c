#include <stdint.h>
/* Sorted participant IDs are mapped to array indices by the trusted adapter. */
static uint32_t weights[50];
static uint32_t seats[50];
static uint64_t remainder[50];
uint32_t *weights_ptr(void) { return weights; }
uint32_t *result_ptr(void) { return seats; }
int allocate(uint32_t n, uint32_t units, uint32_t method) {
    if (n == 0 || n > 50 || units > 10000 || method > 1) return 1;
    uint64_t total = 0;
    for (uint32_t i = 0; i < n; i++) {
        if (weights[i] == 0 || weights[i] > 1000000) return 1;
        total += weights[i]; seats[i] = 0; remainder[i] = 0;
    }
    if (method == 0) {
        uint32_t assigned = 0;
        for (uint32_t i = 0; i < n; i++) {
            uint64_t product = (uint64_t)units * weights[i];
            seats[i] = (uint32_t)(product / total);
            remainder[i] = product % total;
            assigned += seats[i];
        }
        while (assigned < units) {
            uint32_t best = 0;
            for (uint32_t i = 1; i < n; i++) if (remainder[i] > remainder[best]) best = i;
            seats[best]++; remainder[best] = 0; assigned++;
        }
    } else {
        for (uint32_t assigned = 0; assigned < units; assigned++) {
            uint32_t best = 0;
            for (uint32_t i = 1; i < n; i++) {
                /* Cross multiplication avoids floating-point quotient ties. */
                if ((uint64_t)weights[i] * (seats[best] + 1) >
                    (uint64_t)weights[best] * (seats[i] + 1)) best = i;
            }
            seats[best]++;
        }
    }
    return 0;
}
#ifdef NATIVE_TEST
int main(void) {
    weights[0]=5;weights[1]=3;weights[2]=2;
    if(allocate(3,3,0)||seats[0]!=1||seats[1]!=1||seats[2]!=1)return 1;
    if(allocate(3,3,1)||seats[0]!=2||seats[1]!=1||seats[2]!=0)return 2;
    if(allocate(0,3,0)!=1||allocate(3,10001,0)!=1)return 3;
    weights[0]=0;if(allocate(3,3,0)!=1)return 4;
    return 0;
}
#endif

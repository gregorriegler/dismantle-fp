import { expect } from "chai"

/*
Dy MxT   MnT   AvT   HDDay  AvDP 1HrP TPcpn WxType PDir AvSp Dir MxS SkyC MxR MnR AvSLP

   1  88    59    74          53.8       0.00 F       280  9.6 270  17  1.6  93 23 1004.5
   2  79    63    71          46.5       0.00         330  8.7 340  23  3.3  70 28 1004.5
*/

/*
* Algorithm (solution)
* - read lines
* - calc spread
* - find min
* - report day
*
* Design (units)
* - outside in
*/

describe("Weather Data", () => {

    it("find_min_spread", () => {
        const day = find_min_spread_day("test/datamunging/part1/weather1line.dat")

        expect(day).to.equal(1)
    })
})

function find_min_spread_day(data_file_name: string) {
    throw new Error("Function not implemented.")
}

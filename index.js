import { h, app } from "hyperapp"
import * as areas from "./areas"

const state = {
  pendel: [],
  announcements: [],
}

const actions = {
  fetchStations: () => async (state, actions) => {
    const v = await fetch("http://localhost:1337/json/pendel")
    actions.pendel(await v.json())
  },
  fetchTrains: locationSignature => async (state, actions) => {
    const url = `http://localhost:1337/json/departures?since=0:15&until=0:59&locations=${locationSignature}`
    const v = await fetch(url)
    const message = await v.json()
    const {
      RESPONSE: {
        RESULT: [{ TrainAnnouncement: announcements }],
      },
    } = message
    actions.announcements(announcements)
  },
  pendel: pendel => () => ({ pendel }),
  announcements: announcements => () => ({ announcements }),
}

function view({ pendel, announcements }, actions) {
  return announcements.length ? (
    <table>
      {announcements.map(a => {
        return (
          <tr>
            <td>{a.Deviation && a.Deviation.join()}</td>
            {location()}
            <td>
              {a.TimeAtLocation ? (
                <b>{field("")}</b>
              ) : a.EstimatedTimeAtLocation ? (
                <i>{field("Estimated")}</i>
              ) : (
                field("Advertised")
              )}
            </td>
          </tr>
        )

        function location() {
          return a.ToLocation.map(l => {
            const found = pendel.find(
              p => p.LocationSignature === l.LocationName
            )
            return <td>{found.AdvertisedShortLocationName}</td>
          })
        }

        function field(field) {
          const t = a[`${field}TimeAtLocation`]
          return t && t.substr(11, 5)
        }
      })}
    </table>
  ) : (
    <div id="navs">
      <span>{announcements.length}</span>
      <nav className="pull-left">{pendel.filter(areas.nw).map(tr)}</nav>
      <nav className="pull-right">{pendel.filter(areas.ne).map(tr)}</nav>
      <nav className="pull-left narrow">{pendel.filter(areas.ncw).map(tr)}</nav>
      <nav className="center">{pendel.filter(areas.nc).map(tr)}</nav>
      <nav className="pull-right narrow">
        {pendel.filter(areas.nce).map(tr)}
      </nav>
      <nav className="center wide">{pendel.filter(areas.c).map(tr)}</nav>
      <nav className="pull-left narrow">{pendel.filter(areas.scw).map(tr)}</nav>
      <nav className="center narrow">{pendel.filter(areas.sc).map(tr)}</nav>
      <nav className="pull-right narrow">
        {pendel.filter(areas.sce).map(tr)}
      </nav>
      <nav className="pull-left">{pendel.filter(areas.sw).map(tr)}</nav>
      <nav className="pull-right">{pendel.filter(areas.se).map(tr)}</nav>
    </div>
  )

  function tr(station) {
    return (
      <div onclick={() => actions.fetchTrains(station.LocationSignature)}>
        {station.AdvertisedShortLocationName}
      </div>
    )
  }
}

const main = app(state, actions, view, document.body)

main.fetchStations()

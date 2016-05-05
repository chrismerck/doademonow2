  var initialStateModule = require("initialstate/initialstateclient");

  /**
   * Abstraction of the underlying analytics service (this class is an "analytics service provider")
   * Knows how to interact with the chosen analytics service (through the corresponding connector)
   * @class AnalyticsDelegate
   * @class
   */
  function AnalyticsDelegate() {
    this.provider = new initialStateModule.InitialState(); // We have chosen InitialState as an anaytics service
  }

  /**
   * Streams events to the selected analytics service
   * @method streamEvents
   * @param {Object} [dto]
   * @param {String} [dto.bucketId] : identifier of the target bucket
   * @param {String} [dto.bucketName] : name of the target bucket
   * @param {Array} [dto.events] : arrat of events {key, value}
   */
  AnalyticsDelegate.prototype.streamEvents = function(dto) {

    if (!dto || !dto.bucketId || !dto.events) {

      throw {

        errorCode: "Invalid_Parameter",
        errorDetail: "AnalyticsDelegate.streamEvent : dto, dto.bucketId and dto.events  cannot be null of empty"
      };
    }

    this.provider.createBucket({bucketKey: dto.bucketId, bucketName: dto.bucketId});
    return this.provider.sendEvents({"bucketKey": dto.bucketId, "events": dto.events})
  };

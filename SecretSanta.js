var SecretSanta = function () {

    this.names = [];

    this.enforced = Object.create( null );
    this.blacklists = Object.create( null );
};


SecretSanta.prototype.add = function ( name ) {

    if ( this.names.indexOf( name ) !== -1 )
        throw new Error( 'Cannot redefine ' + name );

    this.names.push( name );

    var subapi = { };

    subapi.enforce = function ( other ) {

        this.enforced[ name ] = other;

        return subapi;

    }.bind( this );

    subapi.blacklist = function ( other ) {

        if ( ! Object.prototype.hasOwnProperty.call( this.blacklists, name ) )
            this.blacklists[ name ] = [];

        if ( this.blacklists[ name ].indexOf( other ) === -1 )
            this.blacklists[ name ].push( other );

        return subapi;

    }.bind( this );

    return subapi;

};

SecretSanta.prototype.generate = function () {

    var maxAttempts = 1000;
    var attempt = 0;

    // Helper function to check if a circular arrangement respects all constraints
    var isValidCircle = function ( arrangement ) {

        for ( var i = 0; i < arrangement.length; i++ ) {
            var giver = arrangement[ i ];
            var receiver = arrangement[ ( i + 1 ) % arrangement.length ];

            // Check enforced pairings
            if ( Object.prototype.hasOwnProperty.call( this.enforced, giver ) ) {
                if ( this.enforced[ giver ] !== receiver ) {
                    return false;
                }
            }

            // Check blacklists
            if ( Object.prototype.hasOwnProperty.call( this.blacklists, giver ) ) {
                if ( this.blacklists[ giver ].indexOf( receiver ) !== -1 ) {
                    return false;
                }
            }

            // Check that person doesn't give to themselves (shouldn't happen in circle but be safe)
            if ( giver === receiver ) {
                return false;
            }
        }

        return true;

    }.bind( this );

    // Validate enforced pairings exist in names list
    Object.keys( this.enforced ).forEach( function ( name ) {
        var enforced = this.enforced[ name ];
        if ( this.names.indexOf( enforced ) === -1 ) {
            throw new Error( name + ' is paired with ' + enforced + ', which hasn\'t been declared as a possible pairing' );
        }
    }, this );

    // Try to find a valid circular arrangement
    while ( attempt < maxAttempts ) {
        attempt++;

        // Shuffle the names to create a random circular arrangement
        var arrangement = _.shuffle( this.names.slice() );

        // Check if this arrangement satisfies all constraints
        if ( isValidCircle( arrangement ) ) {
            // Build the pairings object from the circular arrangement
            var pairings = Object.create( null );
            for ( var i = 0; i < arrangement.length; i++ ) {
                var giver = arrangement[ i ];
                var receiver = arrangement[ ( i + 1 ) % arrangement.length ];
                pairings[ giver ] = receiver;
            }
            return pairings;
        }
    }

    // If we couldn't find a valid arrangement after many attempts
    throw new Error( 'Could not generate a valid circular Secret Santa arrangement after ' + maxAttempts + ' attempts. Your constraints (enforced pairings or blacklists) may be too restrictive. Try removing some rules and try again.' );

};
